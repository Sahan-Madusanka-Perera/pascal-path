program DataTypesDemo;
var
  studentName : string;
  age : integer;
  height : real;
  isPassed : boolean;
  grade : char;
begin
  { Input values }
  studentName := 'Nimal Silva';
  age := 16;
  height := 5.6;
  isPassed := true;
  grade := 'A';
  { Display all information }
  writeln('=== Student Information ===');
  writeln('Name: ', studentName);
  writeln('Age: ', age, ' years');
  writeln('Height: ', height:0:1, ' feet');
  writeln('Passed: ', isPassed);
  writeln('Grade: ', grade);
end.
