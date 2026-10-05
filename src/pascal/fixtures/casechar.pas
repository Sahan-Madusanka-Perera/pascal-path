program GradeComment;
var
  grade : char;
begin
  write('Enter grade (A/B/C/S/F): ');
  readln(grade);
  case grade of
    'A', 'a' : writeln('Outstanding performance!');
    'B', 'b' : writeln('Very good work!');
    'C', 'c' : writeln('Good job!');
    'S', 's' : writeln('Satisfactory');
    'F', 'f' : writeln('Need improvement');
  else
    writeln('Invalid grade');
  end;
end.
