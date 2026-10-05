program Strs;
var s, r: string; i: integer; c: char;
begin
  s := 'level';
  r := '';
  for i := length(s) downto 1 do
    r := r + s[i];
  if r = s then writeln(s, ' is a palindrome') else writeln('no');
  c := upcase('a');
  writeln(c, ord('A'), chr(66), length('hello'), copy('Pascal', 2, 3), pos('c', 'Pascal'));
  writeln(round(2.5), ' ', round(3.5), ' ', trunc(-2.7), ' ', sqr(5), ' ', sqrt(16):0:1, ' ', abs(-3));
  writeln('A':3, 'xy':5, true:6, 42:6);
  writeln(odd(3), ' ', succ('a'), ' ', pred(10));
end.
