program Fact;
var n, i: integer; f: longint;
function Fib(n: integer): integer;
begin
  if n <= 1 then Fib := n
  else Fib := Fib(n - 1) + Fib(n - 2);
end;
begin
  n := 6; f := 1;
  for i := 1 to n do f := f * i;
  writeln(n, '! = ', f);
  for i := 0 to 10 do write(Fib(i), ' ');
  writeln;
  n := 1234; f := 0;
  while n > 0 do begin f := f * 10 + n mod 10; n := n div 10; end;
  writeln(f);
end.
