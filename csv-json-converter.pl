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
    open($fh, '>', "$new_file") or die "if ucked up bad boss";
    print $fh "\"round\":\[\n";
    my $prev_round = -1;
    my @headers = split(/,/, $round_data[0]);
    #print @headers;
    my $inc;
    for ($inc = 1; $inc < $#round_data; $inc++){
        my @line = split(/,/, $round_data[$inc]);
        print @line;
        if ($#line != 2){

        }
    }
}
