#### 0. Prerequisites

Make sure you have installed [NodeJS](https://nodejs.org/en/download/), for sure also [ExpressJS](https://expressjs.com/en/starter/installing.html).
Last, because of size of directory "node_modules" is big, therefore this directory is not included in project, you must install modules automaticaly via writing `npm i` in command line in directory with project after NodeJS is installed.

#### 1. Run Node JS Performance Tests 

For running Node JS Performance Test just type in command line `node 00.performance.tests.js [optional arguments]`.
##### Optional arguments
- `[-i|--iterations <int>]` - number of iterations via tests, default value is __1000__
- `[-o, --output <value>]` - creates directory for save CSV file, default value is __./output__
- `[-n, --name <value>]` - name of saved CSV file, default value is __results_nodejs_single__

The created CSV file will contain the durations of the subtests.
