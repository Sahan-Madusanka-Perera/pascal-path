program RealFmt;
var height, average, price: real;
begin
  height := 5.8; average := 87.5; price := 1250.75;
  writeln('Height: ', height:0:2, ' feet');
  writeln('Average: ', average:0:1, '%');
  writeln('Price: Rs. ', price:0:2);
  writeln(height);
  writeln(-price:12:3);
  writeln(1/3);
  writeln(average:12);
end.
