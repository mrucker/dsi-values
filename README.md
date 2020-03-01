# dsi-values

An online movie recommendation site for Charlottesville Virginia.

# Algorithms
  * Linear contextual bandit modification of Abbeel and Ngs "Apprenticeship Learning via Inverse Reinforcement Learning".
  * Kernel contextual bandit modification of Abbeel and Ngs "Apprenticeship Learning via Inverse Reinforcement Learning".
 
# Algorithm Implmenetation
  * Both algorithms have been implemented in JS and run on the client's machine.
  * To perform the vector calculations TensorFlow.js is used.

# Hosting

  * The HTML and JS for the site is stored on S3 and uses AWS's CDN, DNS and Certificate Manager.
  * The production version of this project is deployed at [https://dsi.markrucker.net](https://dsi.markrucker.net)
  
# Data

  * The backend of this site runs a nightly job to query the next weeks movies from: 
    * [http://developer.tmsapi.com/](http://developer.tmsapi.com/)
    * [http://www.omdbapi.com/](http://www.omdbapi.com/)
  * The nightly backend job stores the movie data in AWS's No-SQL DynamoDB
  * The frontend of this site uses DynamoDB's JS API to directly query the movie times and theaters
