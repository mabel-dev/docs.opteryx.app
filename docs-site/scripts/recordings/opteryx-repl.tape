Output ../../public/images/cli/opteryx-repl.gif

Require python

Set Shell "bash"
Set FontSize 16
Set FontFamily "Menlo"
Set Width 900
Set Height 560
Set Padding 20
Set Theme "Dracula"
Set TypingSpeed 45ms

Hide
Type "source venv/bin/activate && clear" Enter
Sleep 500ms
Show

Type "python -m opteryx"
Enter
Sleep 3.5s

Type "SELECT name, gravity FROM $planets ORDER BY mass DESC;"
Sleep 500ms
Enter
Sleep 5s

Type ".exit"
Enter
Sleep 1s
