program ConstantExample;
const
  PI = 3.14159;
  DAYS_IN_WEEK = 7;
  PASS_MARK = 50;
var
  radius : real;
  area : real;
begin
  radius := 5.0;
  area := PI * radius * radius;
  writeln('Radius: ', radius:0:2);
  writeln('Area: ', area:0:2);
  writeln('Pass mark is: ', PASS_MARK);
end.
