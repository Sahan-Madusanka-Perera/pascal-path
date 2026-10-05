program ProcedureCircle(input, output);
const
  PI = 22/7;
var
  radius : real;

procedure GetData(var r : real);
begin
  write('Enter radius: ');
  readln(r);
end;

procedure ProcessArea(r : real);
var
  area : real;
begin
  area := PI * r * r;
  writeln('Area = ', area:0:2);
end;

function Circumference(r : real) : real;
begin
  Circumference := 2 * PI * r;
end;

function Square(n: integer): integer;
begin
  Square := n * n;
end;

procedure Swap(var a, b: integer);
var t: integer;
begin
  t := a; a := b; b := t;
end;

var x, y: integer;
begin
  GetData(radius);
  writeln('Circumference = ', Circumference(radius):0:2);
  ProcessArea(radius);
  writeln(Square(7));
  x := 1; y := 2;
  Swap(x, y);
  writeln(x, ' ', y);
end.
