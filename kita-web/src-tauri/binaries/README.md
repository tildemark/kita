# This directory holds the kita-core sidecar binary for distribution.
#
# Before running `npm run tauri:build`, copy the compiled kita-core binary here:
#
#   cargo build --release
#   Copy-Item ..\kita-core\target\release\kita-core.exe `
#     .\src-tauri\binaries\kita-core-x86_64-pc-windows-msvc.exe
#
# The filename MUST include the Rust target triple suffix as Tauri requires it.
# Run `rustc -vV` and look for "host:" to confirm your target triple.
