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
    print $fh "\{\n";
    print $fh "\"round\":\n";
    my $prev_round = -1;
    my @headers = split(/,/, $round_data[0]);
    $headers[5] =~ s/\n//g;
    #print @headers;
    my $inc;
    my $round = 1;
    for ($inc = 1; $inc < $#round_data; $inc++){
        my @line = split(/,/, $round_data[$inc]);
        print @line;
            my $inc2;
            print $fh "\t\{\n";
            print $fh "\t\"games\":\[\n";
            for ($inc2 = $inc; $inc2 < $#round_data && !($line[1] =~ m/BYE/)
                && $line[0] == $round;
                @line = split(/,/, $round_data[++$inc2])){
                    $line[5] =~ s/(\n|\")//g;
                    print $fh "\t\t\{\n";
                    print $fh "\t\t\"$headers[0]\":\"$line[0]\",\n";
                    print $fh "\t\t\"$headers[1]\":\"$line[1]\",\n";
                    print $fh "\t\t\"$headers[2]\":\"$line[2]\",\n";
                    print $fh "\t\t\"$headers[3]\":\"$line[3]\",\n";
                    print $fh "\t\t\"$headers[4]\":\"$line[4]\",\n";
                    print $fh "\t\t\"$headers[5]\":\"$line[5]\"\n";
                    print $fh "\t\t\}\n";
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
            }
            print $fh "\t\}\n";
            if ($round <= 15){
            print $fh ",\n";
            print $fh "\"round\":\n";
            $round++;
        }
    }
    print $fh "\n";
    print $fh "\}\n";
}