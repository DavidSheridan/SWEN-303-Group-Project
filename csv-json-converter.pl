#!/usr/bin/perl
use strict;
use warnings;


my @round_data;
my $fh;

foreach(@ARGV){
    print $_;
    open ($fh, '<', "$_") or die;
    foreach (<$fh>){
        my $temp = $_;
        $temp =~ s/\t//g;
        push(@round_data, $temp);
    }
    #print @round_data;
    close($fh);
    my $new_file = $_;
    $new_file =~ s/\.csv/\.json/g;
    open($fh, '>', "$new_file") or die "";
    print $fh "\{\"rounds\":\[\n";
    print $fh "\{\"round\":\n";
    my $prev_round = -1;
    my @headers = split(/,/, $round_data[0]);
    $headers[5] =~ s/(\n|\r)//g;
    #print @headers;
    my $inc;
    my $round = 1;
    for (my $i = 1; $i <= $#round_data; $i++){
        $round_data[$i] =~ s/\"//g;
    }
    for ($inc = 1; $inc <= $#round_data && $round <= 17; $inc++){
        my @line = split(/,/, $round_data[$inc]);
        print @line;
            my $inc2;
            print $fh "\t\{\n";
            print $fh "\t\"games\":\[\n";
            for ($inc2 = $inc; $inc2 <= $#round_data && !($line[1] =~ m/BYE/)
                && $line[0] == $round;
                @line = split(/,/, $round_data[++$inc2])){
                    print @line;
                    $line[5] =~ s/(\n|\"|\r)//g;
                    $line[6] =~ s/(\n|\"|\r)//g;
                    print $fh "\t\t\{\n";
                    print $fh "\t\t\"$headers[0]\":\"$line[0]\",\n";
                    if ($line[2] =~ m/(pm|am)/){
                        print $fh "\t\t\"$headers[1]\":\"$line[1],$line[2]\",\n";
                        print $fh "\t\t\"$headers[2]\":\"$line[3]\",\n";
                        $line[4] =~ s/(—|–)/-/g;
                        print $fh "\t\t\"$headers[3]\":\"$line[4]\",\n";
                        print $fh "\t\t\"$headers[4]\":\"$line[5]\",\n";
                        print $fh "\t\t\"$headers[5]\":\"$line[6]\"\n";
                    }
                    else {
                        print $fh "\t\t\"$headers[1]\":\"$line[1]\",\n";
                        print $fh "\t\t\"$headers[2]\":\"$line[2]\",\n";
                        $line[3] =~ s/(—|–)/-/g;
                        print $fh "\t\t\"$headers[3]\":\"$line[3]\",\n";
                        print $fh "\t\t\"$headers[4]\":\"$line[4]\",\n";
                        print $fh "\t\t\"$headers[5]\":\"$line[5]\"\n";
                    }
                    print $fh "\t\t\}\n";
                    if ($#round_data > $inc2+1){
                        my @temp = split(/,/, $round_data[$inc2+1]);
                        if ($temp[0] == $round && !($temp[1] =~ m/BYES:/)){
                            print $fh "\t\t,\n";
                        }
                    }
            }
            print $fh "\t\]\n";
            $inc = $inc2;
            if ($line[1] =~ m/BYE/){
                print $fh "\t,\n";
                $line[1] =~ s/BYES:(  )*//g;
                print $fh "\t\"Bye\":\"$line[1]\"\n";
            }
            else {
                print $fh "\t,\n";
                print $fh "\t\"Bye\":\"\"\n";
                $inc -= 1;
            }
            print $fh "\t\}\n";
            $round++;
            if ($round <= 17){
            print $fh "\},\n";
            print $fh "\{\"round\":\n";
            }
    }
    print $fh "\}\n";
    print $fh "\]\}\n";
}
