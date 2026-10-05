program OrExample;
var
  day : string;
begin
  write('Enter day: ');
  readln(day);
  if (day = 'Saturday') or (day = 'Sunday') then
    writeln('It''s a weekend!')
  else
    writeln('It''s a weekday');
end.
