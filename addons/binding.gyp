{
    "targets": [
        {
            "target_name": "YYY-tools-win64",
            "cflags!": ["-fno-exceptions"],
            "cflags_cc!": ["-fno-exceptions"],
            "sources": ["tools.cc"],
            "include_dirs": ["<!@(node -p \"require('node-addon-api').include\")"],
            "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"],
            "libraries": ["-lntdll"],
        },
    ]
}
