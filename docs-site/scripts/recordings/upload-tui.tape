Output ../../public/images/cli/upload-tui.gif

Require python3

Set Shell "bash"
Set FontSize 15
Set FontFamily "Menlo"
Set Width 1040
Set Height 480
Set Padding 20
Set Theme "Dracula"
Set TypingSpeed 45ms

Hide
Type "source venv/bin/activate" Enter
Sleep 300ms
Type "pkill -f mock_upload_server.py 2>/dev/null; python mock_upload_server.py 8756 >/tmp/mock-upload-server.log 2>&1 & disown" Enter
Sleep 500ms
Type "export OPTERYX_TOKEN=demo OPTERYX_UPLOAD_URL=http://127.0.0.1:8756 && clear" Enter
Sleep 500ms
Show

Type "opteryx-upload tui sample-data/findings.csv --to acme.security.findings"
Enter
Sleep 1.2s

# negotiate
Type "n"
Sleep 2s

# look through the plan
Down
Sleep 400ms
Down
Sleep 400ms
Down
Sleep 700ms

# accept the proposed types
Enter
Sleep 900ms

# upload and commit
Type "u"
Sleep 2.6s

# quit, leaving the committed message on screen
Type "q"
Sleep 1.2s

Hide
Type "pkill -f mock_upload_server.py 2>/dev/null" Enter
Show
