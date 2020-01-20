include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";

template InAuthorizedRange(){

    // Public inputs are the latitude and longitude ranges for an authorized fishing area.
    signal input latitudeRange[2]; // Ranging from 0 to 180. i.e. (20, 21)
    signal input longitudeRange[2]; // Ranging from 0 to 360 i.e. (76, 172)

    // The private input is the location where the fish was caught.
    // This is in the form (latitude, longitude)
    signal private input fishingLocation[2];
    signal output out; // 0 or 1

    // Max num bits would be 9. 2^9 = 512, which is greater than max longitude range, 360. 

    // The fishing latitude has to be greater than or equal to 
    // the min latitude of the authorized area
    component gt1 = GreaterEqThan(9);
    gt1.in[0] <== fishingLocation[0];
    gt1.in[1] <== latitudeRange[0];
    gt1.out === 1; 

    out <-- gt1.out;
    

    // The fishing latitude has to be less than or equal to 
    // the max latitude of the authorized area
    component lt1 = LessEqThan(9);
    lt1.in[0] <== fishingLocation[0];
    lt1.in[1] <== latitudeRange[1];
    lt1.out === 1;

    // The fishing longitude has to be greater than or equal to 
    // the min longitude of the authorized area
    component gt2 = GreaterEqThan(9);
    gt2.in[0] <== fishingLocation[1];
    gt2.in[1] <== longitudeRange[0];
    gt2.out === 1;  

    // The fishing longitude has to be less than or equal to 
    // the max longitude of the authorized area
    component lt2 = LessEqThan(9);
    lt2.in[0] <== fishingLocation[1];
    lt2.in[1] <== longitudeRange[1];
    lt2.out === 1;  

    out <-- (gt1.out + gt2.out + lt1.out + lt2.out) * 1/4;
    out === 1;
}

component main = InAuthorizedRange();