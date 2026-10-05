program DivMod;
var
  number, divisor : integer;
  quotient, remainder : integer;
begin
  number := 17;
  divisor := 5;
  quotient := number div divisor;
  remainder := number mod divisor;
  writeln(number, ' divided by ', divisor);
  writeln('Quotient: ', quotient);
  writeln('Remainder: ', remainder);
  writeln(-17 div 5, ' ', -17 mod 5, ' ', 17 mod -5, ' ', 10 / 4:0:2);
end.
