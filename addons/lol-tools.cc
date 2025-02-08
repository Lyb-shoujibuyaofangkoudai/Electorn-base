#include <napi.h>
#include <Windows.h>  // 引入Windows API相关的头文件
#include <stdint.h>   // 引入固定宽度整数类型的定义
#include <TlHelp32.h> // 引入用于创建进程快照和遍历进程的API
#include <psapi.h>    // 引入用于获取进程信息的API
#include <string>
#include <winternl.h> // 引入 winternl.h
#include <ntstatus.h>
#include <memory> // 引入智能指针
#include <shellapi.h>

// 手动实现 UTF-16 到 UTF-8 的转换
std::string utf16_to_utf8(const std::u16string &utf16)
{
  std::string utf8;
  for (char16_t wc : utf16)
  {
    if (wc < 0x80)
    {
      utf8.push_back(static_cast<char>(wc));
    }
    else if (wc < 0x800)
    {
      utf8.push_back(static_cast<char>(0xC0 | (wc >> 6)));
      utf8.push_back(static_cast<char>(0x80 | (wc & 0x3F)));
    }
    else
    {
      utf8.push_back(static_cast<char>(0xE0 | (wc >> 12)));
      utf8.push_back(static_cast<char>(0x80 | ((wc >> 6) & 0x3F)));
      utf8.push_back(static_cast<char>(0x80 | (wc & 0x3F)));
    }
  }
  return utf8;
}

// 定义NTSTATUS类型
typedef LONG NTSTATUS;

// 声明NtQueryInformationProcess函数原型
typedef NTSTATUS(WINAPI *pNtQueryInformationProcess)(
    HANDLE ProcessHandle,
    INT ProcessInformationClass,
    PVOID ProcessInformation,
    ULONG ProcessInformationLength,
    PULONG ReturnLength);

HANDLE OpenProcessFromPid(DWORD pid, DWORD access)
{
  return OpenProcess(access, FALSE, pid);
}

// 获取进程命令行的函数
int getProcessCommandLine(DWORD pid, WCHAR **pdata, SIZE_T *psize)
{
  // 获取ntdll.dll模块的句柄
  HMODULE hNtdll = GetModuleHandle("ntdll.dll");
  if (hNtdll)
  {
    // 获取NtQueryInformationProcess函数地址
    pNtQueryInformationProcess NtQueryInformationProcess = (pNtQueryInformationProcess)GetProcAddress(hNtdll, "NtQueryInformationProcess");
    if (NtQueryInformationProcess)
    {
      // 打开目标进程，请求查询受限信息权限
      HANDLE hProcess = OpenProcessFromPid(pid, PROCESS_QUERY_LIMITED_INFORMATION);
      if (hProcess == NULL)
      {
        //         fprintf(stderr, "Failed to open process with PID %lu: %lu\n", pid, GetLastError());
        return -1;
      }

      // 分配缓冲区并获取所需缓冲区大小
      std::unique_ptr<char[]> buffer;
      ULONG bufLen = 0;
      NTSTATUS status = NtQueryInformationProcess(hProcess, (PROCESSINFOCLASS)60, NULL, 0, &bufLen);
      if (status != STATUS_BUFFER_OVERFLOW && status != STATUS_BUFFER_TOO_SMALL && status != STATUS_INFO_LENGTH_MISMATCH)
      {
        //         fprintf(stderr, "NtQueryInformationProcess failed with status 0x%lx\n", status);
        CloseHandle(hProcess);
        return -1;
      }

      // 分配足够大的缓冲区
      buffer.reset(new char[bufLen]);
      if (!buffer)
      {
        //         fprintf(stderr, "Memory allocation failed\n");
        CloseHandle(hProcess);
        return -1;
      }

      // 获取进程命令行信息
      status = NtQueryInformationProcess(hProcess, (PROCESSINFOCLASS)60, buffer.get(), bufLen, &bufLen);
      if (!NT_SUCCESS(status))
      {
        //         fprintf(stderr, "NtQueryInformationProcess failed with status 0x%lx\n", status);
        CloseHandle(hProcess);
        return -1;
      }

      // 将命令行信息从UNICODE_STRING转换为WCHAR数组
      PUNICODE_STRING tmp = reinterpret_cast<PUNICODE_STRING>(buffer.get());
      size_t size = (wcslen(tmp->Buffer) + 1) * sizeof(WCHAR);
      std::unique_ptr<WCHAR[]> bufWchar(new WCHAR[size / sizeof(WCHAR)]);
      if (!bufWchar)
      {
        //         fprintf(stderr, "Memory allocation failed\n");
        CloseHandle(hProcess);
        return -1;
      }
      wcscpy_s(bufWchar.get(), size / sizeof(WCHAR), tmp->Buffer);
      *pdata = bufWchar.release();
      *psize = size;

      // 关闭进程句柄
      CloseHandle(hProcess);
      return 0;
    }
    else
    {
      // 处理错误：无法获取函数地址
      //       fprintf(stderr, "Failed to get address of NtQueryInformationProcess\n");
      return -1;
    }
  }
  else
  {
    // 处理错误：无法加载 ntdll.dll
    //     fprintf(stderr, "Failed to load ntdll.dll\n");
  }
  return -1;
}

// 获取进程命令行的函数
Napi::Value GetProcessCommandLine(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  if (info.Length() < 1 || !info[0].IsNumber())
  {
    Napi::TypeError::New(env, "Number expected").ThrowAsJavaScriptException();
    return env.Null();
  }

  DWORD pid = info[0].As<Napi::Number>().Uint32Value();
  WCHAR *cmdline = NULL;
  SIZE_T cmdline_size = 0;
  int result = getProcessCommandLine(pid, &cmdline, &cmdline_size);

  if (result == 0 && cmdline != NULL)
  {
    // 将 WCHAR* 转换为 std::wstring
    std::wstring wcmd(cmdline);

    // 将 std::wstring 转换为 std::u16string
    std::u16string u16cmd(wcmd.begin(), wcmd.end());

    // 将 std::u16string 转换为 std::string（UTF-8 编码）
    std::string utf8_cmd = utf16_to_utf8(u16cmd);

    // 打印结果
    free(cmdline);
    return Napi::String::New(env, utf8_cmd);
  }
  else
  {
    return Napi::String::New(env, "");
  }
}

/*
    根据进程名称获取进程ID
 */
int getPidByName(const char *processName)
{
  HANDLE hSnapshot;
  PROCESSENTRY32 lppe;
  BOOL Found;
  hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
  lppe.dwSize = sizeof(PROCESSENTRY32);
  Found = Process32First(hSnapshot, &lppe);
  int pid = -1;
  while (Found)
  {
    if (strcmp(processName, lppe.szExeFile) == 0) // 进程名比较
    {
      Found = TRUE;
      pid = lppe.th32ProcessID;
      break;
    }
    Found = Process32Next(hSnapshot, &lppe); // 得到下一个进程
  }
  CloseHandle(hSnapshot);
  return pid;
}

// 根据进程名称获取进程ID
Napi::Value GetPidByName(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  if (info.Length() < 1 || !info[0].IsString())
  {
    Napi::TypeError::New(env, "String expected").ThrowAsJavaScriptException();
    return env.Null();
  }

  std::string processName = info[0].As<Napi::String>().Utf8Value();
  int pid = getPidByName(processName.c_str());

  return Napi::Number::New(env, pid);
}

Napi::Value IsElevated(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  bool bIsElevated = false;

  // Windows特定的权限检测
  BOOL isMember = FALSE;
  PSID administratorsGroup = nullptr;
  SID_IDENTIFIER_AUTHORITY SIDAuthNT = SECURITY_NT_AUTHORITY;

  if (AllocateAndInitializeSid(
          &SIDAuthNT, 2, SECURITY_BUILTIN_DOMAIN_RID, DOMAIN_ALIAS_RID_ADMINS,
          0, 0, 0, 0, 0, 0, &administratorsGroup))
  {
    CheckTokenMembership(nullptr, administratorsGroup, &isMember);
  }

  if (administratorsGroup)
  {
    FreeSid(administratorsGroup);
  }

  bIsElevated = isMember ? true : false;

  return Napi::Boolean::New(env, bIsElevated);
}

bool IsRunAsAdmin()
{
  BOOL fRet = FALSE;
  DWORD dwError = 0;
  PSID pAdministratorsGroup;

  SID_IDENTIFIER_AUTHORITY NtAuthority = SECURITY_NT_AUTHORITY;
  if (!AllocateAndInitializeSid(
          &NtAuthority,
          2,
          SECURITY_BUILTIN_DOMAIN_RID,
          DOMAIN_ALIAS_RID_ADMINS,
          0, 0, 0, 0, 0, 0,
          &pAdministratorsGroup))
  {
    dwError = GetLastError();
    return false;
  }

  if (!CheckTokenMembership(NULL, pAdministratorsGroup, &fRet))
  {
    dwError = GetLastError();
    FreeSid(pAdministratorsGroup);
    return false;
  }

  FreeSid(pAdministratorsGroup);
  return fRet;
}

bool RequestAdminPrivileges()
{
  if (IsRunAsAdmin())
  {
    return true;
  }

  HINSTANCE hInst = ShellExecute(NULL, TEXT("runas"), TEXT("your_application_path.exe"), NULL, NULL, SW_SHOWNORMAL);
  if ((int)hInst <= 32)
  {
    return false;
  }

  return true;
}
Napi::Value RequestAdmin(Napi::CallbackInfo const &info)
{
  Napi::Env env = info.Env();
  if (!RequestAdminPrivileges())
  {
    Napi::TypeError::New(env, "Failed to request admin privileges").ThrowAsJavaScriptException();
    return env.Null();
  }
  return Napi::Boolean::New(env, true);
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  exports.Set("getPidByName", Napi::Function::New(env, GetPidByName));
  exports.Set("getProcessCommandLine", Napi::Function::New(env, GetProcessCommandLine));
  exports.Set("isElevated", Napi::Function::New(env, IsElevated));
  exports.Set("requestAdmin", Napi::Function::New(env, RequestAdmin));
  return exports;
}

NODE_API_MODULE(lol_tools, Init)
