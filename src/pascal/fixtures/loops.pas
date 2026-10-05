program Loops;
var
  i, count, x : integer;
begin
  for i := 1 to 5 do
    writeln(i);
  for i := 5 downto 1 do
    write(i, ' ');
  writeln('Blast off!');
  count := 1;
  while count <= 3 do
  begin
    writeln('Count: ', count);
    count := count + 1;
  end;
  x := 10;
  while x < 5 do
  begin
    writeln(x);
    x := x + 1;
  end;
  x := 10;
  repeat
    writeln(x);
    x := x + 1;
  until x > 5;
end.
