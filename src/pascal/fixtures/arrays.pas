program ICTMarks(input, output);
var
  marks : array[0..4] of integer;
  i, tot, max : integer;
  avg : real;
begin
  tot := 0;
  for i := 0 to 4 do
  begin
    write('Enter marks of student ', i + 1, ': ');
    readln(marks[i]);
    tot := tot + marks[i];
  end;
  avg := tot / 5;
  max := marks[0];
  for i := 1 to 4 do
    if marks[i] > max then
      max := marks[i];
  writeln;
  writeln('Maximum marks = ', max);
  writeln('Average marks = ', avg:0:2);
  for i := 4 downto 0 do write(marks[i]:4);
  writeln;
end.
