#include <iostream>
#include <string>
#include <vector>
#include <windows.h> // 添加这一行
#include <tlhelp32.h>
#include <psapi.h>
#include <memory>

// 定义函数指针类型
typedef NTSTATUS(NTAPI *pNtQuerySystemInformation)(SYSTEM_INFORMATION_CLASS, PVOID, ULONG, PULONG);
typedef NTSTATUS(NTAPI *pNtQueryObject)(HANDLE, OBJECT_INFORMATION_CLASS, PVOID, ULONG, PULONG);

// 定义 STATUS_INFO_LENGTH_MISMATCH
#ifndef STATUS_INFO_LENGTH_MISMATCH
#define STATUS_INFO_LENGTH_MISMATCH ((NTSTATUS)0xC0000004L)
#endif

// 定义 SYSTEM_HANDLE_TABLE_ENTRY_INFO 和 PSYSTEM_HANDLE_TABLE_ENTRY_INFO
typedef struct _SYSTEM_HANDLE_TABLE_ENTRY_INFO
{
  ULONG UniqueProcessId;
  BYTE ObjectTypeNumber;
  BYTE Flags;
  USHORT Handle;
  PVOID Object;
  ACCESS_MASK GrantedAccess;
} SYSTEM_HANDLE_TABLE_ENTRY_INFO, *PSYSTEM_HANDLE_TABLE_ENTRY_INFO;

std::string GetCommandLineByProcessName(const std::string &processName)
{
  HANDLE hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
  if (hSnapshot == INVALID_HANDLE_VALUE)
  {
    return "";
  }

  PROCESSENTRY32W pe32;
  pe32.dwSize = sizeof(PROCESSENTRY32W);

  if (!Process32FirstW(hSnapshot, &pe32))
  {
    CloseHandle(hSnapshot);
    return "";
  }

  do
  {
    if (processName == std::wstring(pe32.szExeFile))
    {
      CloseHandle(hSnapshot);
      HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, pe32.th32ProcessID);
      if (hProcess == NULL)
      {
        return "";
      }

      // 获取 NtQuerySystemInformation 和 NtQueryObject 函数指针
      HMODULE hNtdll = GetModuleHandleW(L"ntdll.dll");
      pNtQuerySystemInformation NtQuerySystemInformation = (pNtQuerySystemInformation)GetProcAddress(hNtdll, "NtQuerySystemInformation");
      pNtQueryObject NtQueryObject = (pNtQueryObject)GetProcAddress(hNtdll, "NtQueryObject");

      if (NtQuerySystemInformation == NULL || NtQueryObject == NULL)
      {
        CloseHandle(hProcess);
        return "";
      }

      std::vector<BYTE> buffer(1024 * 1024);
      ULONG returnLength;
      NTSTATUS status = NtQuerySystemInformation(SystemHandleInformation, buffer.data(), buffer.size(), &returnLength);
      if (status == STATUS_INFO_LENGTH_MISMATCH)
      {
        buffer.resize(returnLength);
        status = NtQuerySystemInformation(SystemHandleInformation, buffer.data(), buffer.size(), &returnLength);
      }

      if (NT_SUCCESS(status))
      {
        // 使用正确的结构体
        PSYSTEM_HANDLE_TABLE_ENTRY_INFO handleInfo = (PSYSTEM_HANDLE_TABLE_ENTRY_INFO)buffer.data();
        ULONG handleCount = (returnLength - sizeof(ULONG)) / sizeof(SYSTEM_HANDLE_TABLE_ENTRY_INFO);

        for (ULONG i = 0; i < handleCount; ++i)
        {
          SYSTEM_HANDLE_TABLE_ENTRY_INFO handleEntry = handleInfo[i];
          HANDLE dupHandle;
          if (DuplicateHandle(hProcess, (HANDLE)handleEntry.Handle, GetCurrentProcess(), &dupHandle, 0, FALSE, DUPLICATE_SAME_ACCESS))
          {
            std::vector<BYTE> objectNameBuffer(1024);
            returnLength = 0;
            status = NtQueryObject(dupHandle, ObjectNameInformation, objectNameBuffer.data(), objectNameBuffer.size(), &returnLength);
            if (status == STATUS_INFO_LENGTH_MISMATCH)
            {
              objectNameBuffer.resize(returnLength);
              status = NtQueryObject(dupHandle, ObjectNameInformation, objectNameBuffer.data(), objectNameBuffer.size(), &returnLength);
            }
            if (NT_SUCCESS(status))
            {
              POBJECT_NAME_INFORMATION objectNameInfo = (POBJECT_NAME_INFORMATION)objectNameBuffer.data();
              if (objectNameInfo->Name.Buffer != NULL)
              {
                std::wstring objectName(objectNameInfo->Name.Buffer, objectNameInfo->Name.Length / sizeof(wchar_t));
                if (objectName.find(L"CommandLine") != std::wstring::npos)
                {
                  // 找到命令行对象，尝试读取其信息
                  std::vector<BYTE> commandLineBuffer(4096);
                  returnLength = 0;
                  status = NtQueryObject(dupHandle, ObjectTypeInformation, commandLineBuffer.data(), commandLineBuffer.size(), &returnLength);
                  if (status == STATUS_INFO_LENGTH_MISMATCH)
                  {
                    commandLineBuffer.resize(returnLength);
                    status = NtQueryObject(dupHandle, ObjectTypeInformation, commandLineBuffer.data(), commandLineBuffer.size(), &returnLength);
                  }
                  if (NT_SUCCESS(status))
                  {
                    POBJECT_TYPE_INFORMATION commandLineInfo = (POBJECT_TYPE_INFORMATION)commandLineBuffer.data();
                    if (commandLineInfo->TypeName.Buffer != NULL)
                    {
                      std::wstring commandLine;
                      HANDLE hProcess2 = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, handleEntry.UniqueProcessId);
                      if (hProcess2 != NULL)
                      {
                        std::unique_ptr<char[]> buffer(new char[1024]);
                        ULONG bufLen = 1024;
                        status = NtQueryInformationProcess(hProcess2, (PROCESSINFOCLASS)60, buffer.get(), bufLen, &bufLen);
                        if (NT_SUCCESS(status))
                        {
                          PUNICODE_STRING tmp = reinterpret_cast<PUNICODE_STRING>(buffer.get());
                          commandLine = std::wstring(tmp->Buffer, tmp->Length / sizeof(wchar_t));
                        }
                        CloseHandle(hProcess2);
                      }
                      std::string result(commandLine.begin(), commandLine.end());
                      CloseHandle(dupHandle);
                      CloseHandle(hProcess);
                      return result;
                    }
                  }
                }
              }
            }
            CloseHandle(dupHandle);
          }
        }
      }
      CloseHandle(hProcess);
    }
  } while (Process32NextW(hSnapshot, &pe32));

  CloseHandle(hSnapshot);
  return "";
}

int main()
{
  std::string processName = "LeagueClientUx.exe";
  std::string cmdline = GetCommandLineByProcessName(processName);
  std::cout << "Command line of process " << processName << " is: " << cmdline << std::endl;
  return 0;
}
