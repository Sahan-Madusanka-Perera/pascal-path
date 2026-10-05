program ComparisonDemo;
var
  marks : integer;
begin
  write('Enter your marks: ');
  readln(marks);
  writeln('Marks >= 75: ', marks >= 75);
  writeln('Marks < 35: ', marks < 35);
  writeln('Marks = 100: ', marks = 100);
end.
