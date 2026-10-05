program SimpleATM;
var
  balance : real;
  choice : integer;
  amount : real;
  pin, enteredPin : string;
begin
  balance := 10000.00;
  pin := '1234';
  write('Enter PIN: ');
  readln(enteredPin);
  if enteredPin <> pin then
  begin
    writeln('Wrong PIN! Access denied.');
    exit;
  end;
  writeln('PIN correct. Welcome!');
  writeln;
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
