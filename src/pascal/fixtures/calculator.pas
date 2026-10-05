program SimpleCalculator;
var
  num1, num2 : real;
  sum, difference, product, quotient : real;
begin
  write('Enter first number: ');
  readln(num1);
  write('Enter second number: ');
  readln(num2);
  sum := num1 + num2;
  difference := num1 - num2;
  product := num1 * num2;
  quotient := num1 / num2;
  writeln;
  writeln('=== Results ===');
  writeln('Sum: ', sum:0:2);
  writeln('Difference: ', difference:0:2);
  writeln('Product: ', product:0:2);
  writeln('Quotient: ', quotient:0:2);
end.
