## Legal Fishing

This Github repo demonstrates how one could set up a Fluree ledger to use zero-knowledge proofs.

In this example, Fluree is deployed as a backend data management platform in managing trusted data. The use-case is a simple example of:

1.) the establishment of a dynamic zone where fishing is allowed
2.) the ability for boats to input catch locations without disclosing where the catch was precisely made
3.) the ability for a third party to validate that the fish was caught in an allowed zone, without disclosing their catch location

Please check out the accompanying [blog post](https://flur.ee/2020/02/05/using-zero-knowledge-proofs-with-fluree/) and [video](https://youtu.be/LlBBaorIzgs) !

To install and launch Fluree locally to support this app backend, follow these steps:

1.) Download Fluree from: https://flur.ee/getstarted/ (local install, not hosted)
2.) Unzip the fluree-latest.zip downloaded file
3.) Navigate to the new directory that was created in step 2
4.) Launch Fluree by executing the following script command: `./fluree_start.sh`

Once Fluree is running, it will be visible on localhost:8090
