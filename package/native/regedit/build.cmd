go generate
go build -buildmode=c-shared -o regedit.dll registry_dll
PAUSE