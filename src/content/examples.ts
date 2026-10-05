import type { CodeExample } from './types';
import { pas } from './util';

/** Example programs for the Code Lab — taken from the tute (source of truth). */
export const EXAMPLES: CodeExample[] = [
  {
    id: 'hello', title: 'Hello World', topic: 'intro', description: 'Your first program (§1.2).',
    code: pas`
program HelloWorld;
begin
  writeln('Hello, World!');
  writeln('Welcome to Pascal Programming!');
end.
`,
  },
  {
    id: 'datatypes', title: 'All data types together', topic: 'datatypes', description: 'string, integer, real, boolean and char (§4.6).',
    code: pas`
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
`,
  },
  {
    id: 'variable', title: 'A variable changing', topic: 'variables', description: 'The box stays, the value changes (§5.1).',
    code: pas`
program VariableExample;
var
  score : integer;
begin
  score := 10;
  writeln('Initial score: ', score);

  score := 20;
  writeln('Updated score: ', score);

  score := score + 5;
  writeln('Final score: ', score);
end.
`,
  },
  {
    id: 'constants', title: 'Constants — circle area', topic: 'variables', description: 'Using PI as a constant (§5.2).',
    code: pas`
program ConstantExample;
const
  PI = 3.14159;
  DAYS_IN_WEEK = 7;
  PASS_MARK = 50;
var
  radius : real;
  area : real;
begin
  radius := 5.0;
  area := PI * radius * radius;

  writeln('Radius: ', radius:0:2);
  writeln('Area: ', area:0:2);
  writeln('Pass mark is: ', PASS_MARK);
end.
`,
  },
  {
    id: 'input', title: 'Reading input', topic: 'io', description: 'readln with different data types (§6.2).',
    code: pas`
program InputDemo;
var
  name : string;
  age : integer;
  height : real;
begin
  write('Enter your name: ');
  readln(name);

  write('Enter your age: ');
  readln(age);

  write('Enter your height (in feet): ');
  readln(height);

  writeln;
  writeln('=== Your Information ===');
  writeln('Name: ', name);
  writeln('Age: ', age);
  writeln('Height: ', height:0:2, ' feet');
end.
`,
  },
  {
    id: 'divmod', title: 'div and mod', topic: 'arithmetic', description: 'Quotient and remainder (§7.1).',
    code: pas`
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
end.
`,
  },
  {
    id: 'calculator', title: 'Simple calculator', topic: 'arithmetic', description: 'Arithmetic with real numbers (§7.1.1).',
    code: pas`
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
`,
  },
  {
    id: 'comparison', title: 'Comparison operators', topic: 'relational', description: 'Comparisons give TRUE or FALSE (§7.2).',
    code: pas`
program ComparisonDemo;
var
  marks : integer;
begin
  write('Enter your marks: ');
  readln(marks);

  writeln('Marks >= 75: ', marks >= 75);
  writeln('Marks < 35: ', marks < 35);
  writeln('Marks = 100: ', marks = 100);
end.
`,
  },
  {
    id: 'and', title: 'AND — can you drive?', topic: 'logical', description: 'Both conditions must be TRUE (§7.3.1).',
    code: pas`
program AndExample;
var
  age : integer;
  hasLicense : boolean;
begin
  write('Enter age: ');
  readln(age);
  write('Has license (true/false): ');
  readln(hasLicense);

  if (age >= 18) and (hasLicense = true) then
    writeln('Can drive!')
  else
    writeln('Cannot drive');
end.
`,
  },
  {
    id: 'or', title: 'OR — weekend checker', topic: 'logical', description: 'At least one condition TRUE (§7.3.2).',
    code: pas`
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
`,
  },
  {
    id: 'ifelse', title: 'Pass or fail', topic: 'if', description: 'IF...ELSE (§8.2).',
    code: pas`
program IfElse;
var
  marks : integer;
begin
  write('Enter marks: ');
  readln(marks);

  if marks >= 50 then
    writeln('You PASSED!')
  else
    writeln('You FAILED. Try again next time.');
end.
`,
  },
  {
    id: 'grades', title: 'Grade calculator', topic: 'elseif', description: 'IF...ELSE IF...ELSE (§8.3).',
    code: pas`
program GradeCalculator;
var
  marks : integer;
begin
  write('Enter marks (0-100): ');
  readln(marks);

  if marks >= 75 then
    writeln('Grade: A - Excellent!')
  else if marks >= 65 then
    writeln('Grade: B - Very Good')
  else if marks >= 55 then
    writeln('Grade: C - Good')
  else if marks >= 40 then
    writeln('Grade: S - Satisfactory')
  else
    writeln('Grade: F - Failed');
end.
`,
  },
  {
    id: 'menu', title: 'Menu with CASE', topic: 'case', description: 'Choosing from many values (§8.5).',
    code: pas`
program MenuSystem;
var
  choice : integer;
begin
  writeln('=== Menu ===');
  writeln('1. New Game');
  writeln('2. Load Game');
  writeln('3. Settings');
  writeln('4. Exit');
  write('Enter choice: ');
  readln(choice);

  case choice of
    1 : writeln('Starting new game...');
    2 : writeln('Loading saved game...');
    3 : writeln('Opening settings...');
    4 : writeln('Goodbye!');
  else
    writeln('Invalid choice!');
  end;
end.
`,
  },
  {
    id: 'countdown', title: 'Countdown', topic: 'for', description: 'FOR...DOWNTO (§9.1.2).',
    code: pas`
program Countdown;
var
  i : integer;
begin
  writeln('Countdown:');
  for i := 5 downto 1 do
    writeln(i);
  writeln('Blast off!');
end.
`,
  },
  {
    id: 'table', title: 'Multiplication table', topic: 'for', description: 'A FOR loop with input (§9.1.3).',
    code: pas`
program MultiplicationTable;
var
  number, i : integer;
begin
  write('Enter a number: ');
  readln(number);

  writeln('Multiplication table of ', number, ':');
  for i := 1 to 10 do
    writeln(number, ' x ', i, ' = ', number * i);
end.
`,
  },
  {
    id: 'sumavg', title: 'Sum and average of 5 numbers', topic: 'for', description: 'Accumulating a total in a loop (§9.1.4).',
    code: pas`
program SumAndAverage;
var
  i, number, sum : integer;
  average : real;
begin
  sum := 0;

  for i := 1 to 5 do
  begin
    write('Enter number ', i, ': ');
    readln(number);
    sum := sum + number;
  end;

  average := sum / 5;

  writeln('Sum: ', sum);
  writeln('Average: ', average:0:2);
end.
`,
  },
  {
    id: 'password', title: 'Password checker', topic: 'while', description: 'WHILE until the right password (§9.2.1).',
    code: pas`
program PasswordChecker;
var
  password : string;
begin
  password := '';

  while password <> 'secret' do
  begin
    write('Enter password: ');
    readln(password);

    if password <> 'secret' then
      writeln('Wrong password! Try again.');
  end;

  writeln('Access granted!');
end.
`,
  },
  {
    id: 'repeat', title: 'Positive number validation', topic: 'repeat', description: 'REPEAT...UNTIL (§9.3).',
    code: pas`
program RepeatExample;
var
  number : integer;
begin
  repeat
    write('Enter a positive number: ');
    readln(number);

    if number <= 0 then
      writeln('Invalid! Must be positive.');
  until number > 0;

  writeln('You entered: ', number);
end.
`,
  },
  {
    id: 'whilevsrepeat', title: 'WHILE vs REPEAT', topic: 'repeat', description: 'One prints nothing, one prints once (§9.4).',
    code: pas`
program WhileVsRepeat;
var
  x : integer;
begin
  { WHILE - may not execute at all }
  x := 10;
  while x < 5 do
  begin
    writeln(x);
    x := x + 1;
  end;

  { REPEAT - always executes at least once }
  x := 10;
  repeat
    writeln(x);
    x := x + 1;
  until x > 5;
end.
`,
  },
  {
    id: 'chart', title: 'Multiplication chart', topic: 'nested', description: 'Nested FOR loops (§10.1).',
    code: pas`
program MultiplicationChart;
var
  i, j : integer;
begin
  for i := 1 to 5 do
  begin
    for j := 1 to 5 do
      write(i * j:4);   { :4 gives spacing }
    writeln;            { New line after each row }
  end;
end.
`,
  },
  {
    id: 'stars', title: 'Star pattern', topic: 'nested', description: 'Pattern printing (§10.2).',
    code: pas`
program StarPattern;
var
  i, j : integer;
begin
  for i := 1 to 5 do
  begin
    for j := 1 to i do
      write('*');
    writeln;
  end;
end.
`,
  },
  {
    id: 'evens', title: 'Even numbers', topic: 'nested', description: 'IF inside a FOR loop (§10.3).',
    code: pas`
program EvenNumbers;
var
  i : integer;
begin
  writeln('Even numbers from 1 to 20:');
  for i := 1 to 20 do
  begin
    if i mod 2 = 0 then
      writeln(i);
  end;
end.
`,
  },
  {
    id: 'stats', title: 'Grade statistics', topic: 'nested', description: 'Counters, totals and averages (§10.4).',
    code: pas`
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
`,
  },
  {
    id: 'atm', title: 'Simple ATM', topic: 'programs', description: 'A complete program: repeat + case (§11.1). PIN is 1234.',
    code: pas`
program SimpleATM;
var
  balance : real;
  choice : integer;
  amount : real;
  pin, enteredPin : string;
begin
  balance := 10000.00;
  pin := '1234';

  { PIN verification }
  write('Enter PIN: ');
  readln(enteredPin);

  if enteredPin <> pin then
  begin
    writeln('Wrong PIN! Access denied.');
    exit;
  end;

  writeln('PIN correct. Welcome!');
  writeln;

  { Main menu }
  repeat
    writeln('=== ATM Menu ===');
    writeln('1. Check Balance');
    writeln('2. Withdraw');
    writeln('3. Deposit');
    writeln('4. Exit');
    write('Choice: ');
    readln(choice);

    case choice of
      1 : begin
            writeln('Balance: Rs. ', balance:0:2);
          end;
      2 : begin
            write('Amount to withdraw: ');
            readln(amount);
            if amount > balance then
              writeln('Insufficient funds!')
            else
            begin
              balance := balance - amount;
              writeln('Withdrawn: Rs. ', amount:0:2);
              writeln('New balance: Rs. ', balance:0:2);
            end;
          end;
      3 : begin
            write('Amount to deposit: ');
            readln(amount);
            balance := balance + amount;
            writeln('Deposited: Rs. ', amount:0:2);
            writeln('New balance: Rs. ', balance:0:2);
          end;
      4 : writeln('Thank you! Goodbye.');
    else
      writeln('Invalid choice!');
    end;

    writeln;
  until choice = 4;
end.
`,
  },
  {
    id: 'guess', title: 'Number guessing game', topic: 'programs', description: 'Nested repeat loops (§11.2). The secret number is 42.',
    code: pas`
program GuessingGame;
var
  secretNumber, guess, attempts : integer;
  playAgain : char;
begin
  repeat
    secretNumber := 42;   { In a real version, use random }
    attempts := 0;

    writeln('=== Number Guessing Game ===');
    writeln('I''m thinking of a number between 1-100');
    writeln;

    repeat
      write('Your guess: ');
      readln(guess);
      attempts := attempts + 1;

      if guess < secretNumber then
        writeln('Too low! Try higher.')
      else if guess > secretNumber then
        writeln('Too high! Try lower.')
      else
      begin
        writeln('*** CORRECT! ***');
        writeln('You guessed it in ', attempts, ' attempts!');
      end;
    until guess = secretNumber;

    writeln;
    write('Play again? (Y/N): ');
    readln(playAgain);
    writeln;
  until (playAgain = 'N') or (playAgain = 'n');

  writeln('Thanks for playing!');
end.
`,
  },
  {
    id: 'report', title: 'Student report card', topic: 'programs', description: 'Totals, averages and grades (§11.3).',
    code: pas`
program ReportCard;
var
  name : string;
  maths, science, english : integer;
  total : integer;
  average : real;
  grade : char;
begin
  writeln('=== Student Report Card System ===');
  writeln;

  write('Student name: ');
  readln(name);

  write('Maths marks (0-100): ');
  readln(maths);
  write('Science marks (0-100): ');
  readln(science);
  write('English marks (0-100): ');
  readln(english);

  { Calculate total and average }
  total := maths + science + english;
  average := total / 3;

  { Determine grade }
  if average >= 75 then
    grade := 'A'
  else if average >= 65 then
    grade := 'B'
  else if average >= 55 then
    grade := 'C'
  else if average >= 40 then
    grade := 'S'
  else
    grade := 'F';

  { Print report card }
  writeln;
  writeln('========================================');
  writeln('              REPORT CARD');
  writeln('========================================');
  writeln('Student: ', name);
  writeln('Mathematics    ', maths);
  writeln('Science        ', science);
  writeln('English        ', english);
  writeln('Total:         ', total);
  writeln('Average:       ', average:0:2, '%');
  writeln('Grade:         ', grade);
  writeln('========================================');

  { Pass / Fail decision }
  if grade = 'F' then
    writeln('Result: FAIL')
  else
    writeln('Result: PASS');
end.
`,
  },
  {
    id: 'arrayassign', title: 'Assigning array elements', topic: 'arrays', description: 'Manual assignments (§15.4).',
    code: pas`
program ArrayAssignDemo;
var
  num : array[0..4] of integer;
begin
  num[0] := 45;
  num[2] := 36;
  num[4] := 60;
  num[1] := num[4] + 15;      { 60 + 15 = 75 }
  num[3] := num[0] + num[2];  { 45 + 36 = 81 }

  writeln('num[0] = ', num[0]);
  writeln('num[1] = ', num[1]);
  writeln('num[2] = ', num[2]);
  writeln('num[3] = ', num[3]);
  writeln('num[4] = ', num[4]);
end.
`,
  },
  {
    id: 'arrayloop', title: 'Printing an array with loops', topic: 'arrayloops', description: 'The best way to print arrays (§15.5).',
    code: pas`
program PrintArrayDemo;
var
  num : array[0..4] of integer;
  x : integer;
begin
  num[0] := 45; num[1] := 75; num[2] := 36; num[3] := 81; num[4] := 60;

  writeln('First 4 elements:');
  for x := 0 to 3 do
    writeln(num[x]);

  writeln('Elements 3rd to 5th:');
  for x := 2 to 4 do
    writeln(num[x]);

  writeln('All elements:');
  for x := 0 to 4 do
    writeln(num[x]);
end.
`,
  },
  {
    id: 'ictmarks', title: 'ICT marks: maximum and average', topic: 'arrayloops', description: 'A classic exam program (§15.6), shortened to 5 students.',
    code: pas`
program ICTMarks;
var
  marks : array[0..4] of integer;
  i, tot, max : integer;
  avg : real;
begin
  tot := 0;

  { Input marks and calculate total }
  for i := 0 to 4 do
  begin
    write('Enter marks of student ', i + 1, ': ');
    readln(marks[i]);
    tot := tot + marks[i];
  end;

  avg := tot / 5;

  { Find maximum }
  max := marks[0];
  for i := 1 to 4 do
    if marks[i] > max then
      max := marks[i];

  writeln;
  writeln('Maximum marks = ', max);
  writeln('Average marks = ', avg:0:2);
end.
`,
  },
  {
    id: 'procs', title: 'Circle with procedures', topic: 'procedures', description: 'var and value parameters (§16.5).',
    code: pas`
program ProcedureCircle;
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

procedure ProcessCircumference(r : real);
var
  circum : real;
begin
  circum := 2 * PI * r;
  writeln('Circumference = ', circum:0:2);
end;

begin
  GetData(radius);
  ProcessCircumference(radius);
  ProcessArea(radius);
end.
`,
  },
  {
    id: 'funcs', title: 'Circle with functions', topic: 'functions', description: 'Functions return values (§16.6).',
    code: pas`
program FunctionCircle;
const
  PI = 22/7;
var
  radius : real;

function Area(r : real) : real;
begin
  Area := PI * r * r;
end;

function Circumference(r : real) : real;
begin
  Circumference := 2 * PI * r;
end;

begin
  write('Enter radius: ');
  readln(radius);

  writeln('Circumference = ', Circumference(radius):0:2);
  writeln('Area = ', Area(radius):0:2);
end.
`,
  },
];
