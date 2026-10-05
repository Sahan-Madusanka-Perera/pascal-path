program GradeStatistics;
var
  numStudents, i, marks : integer;
  passCount, failCount : integer;
  totalMarks : integer;
  average : real;
begin
  passCount := 0;
  failCount := 0;
  totalMarks := 0;
  write('How many students? ');
  readln(numStudents);
  for i := 1 to numStudents do
  begin
    write('Enter marks for student ', i, ': ');
    readln(marks);
    totalMarks := totalMarks + marks;
    if marks >= 50 then
    begin
      passCount := passCount + 1;
      writeln('Student ', i, ' PASSED');
    end
    else
    begin
      failCount := failCount + 1;
      writeln('Student ', i, ' FAILED');
    end;
  end;
  average := totalMarks / numStudents;
  writeln;
  writeln('=== STATISTICS ===');
  writeln('Total students: ', numStudents);
  writeln('Passed: ', passCount);
  writeln('Failed: ', failCount);
  writeln('Average marks: ', average:0:2);
end.
