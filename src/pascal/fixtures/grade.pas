program GradeCalculator;
var
  marks : integer;
begin
  write('Enter marks (0-100): ');
  readln(marks);
  if marks >= 75 then
    writeln('Grade: A - Excellent!')
  else if marks >= 65 then
    writeln('Grade: B - Very Good')
  else if marks >= 55 then
    writeln('Grade: C - Good')
  else if marks >= 40 then
    writeln('Grade: S - Satisfactory')
  else
    writeln('Grade: F - Failed');
end.
