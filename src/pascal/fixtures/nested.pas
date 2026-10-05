program MultiplicationChart;
var
  i, j : integer;
begin
  for i := 1 to 5 do
  begin
    for j := 1 to 5 do
      write(i * j:4);
    writeln;
  end;
  for i := 1 to 5 do
  begin
    for j := 1 to i do
      write('*');
    writeln;
  end;
end.
