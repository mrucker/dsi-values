# dsi-values
An online movie recommendation site for Charlottesville Virginia using Contextual Bandit (CB) algorithms/models.

# Algorithms
  * Linear CB modification of Abbeel and Ngs "Apprenticeship Learning via Inverse Reinforcement Learning".
  * Kernel CB modification of Abbeel and Ngs "Apprenticeship Learning via Inverse Reinforcement Learning".
 
# Algorithm Implmenetation
  * Algorithms are implemented in JS and run in the client's web-browser.
  * All vector and matrix calculations are done utilizing TensorFlow.js.

# Hosting
  * The HTML and JS files for the site are stored on S3 and use AWS's CDN, DNS and Certificate Manager for requests.
  * The live version of this project is deployed at [https://dsi.markrucker.net](https://dsi.markrucker.net)
  
# Data
  * The backend of this site runs a nightly job to query the next week's movies from: 
    * [http://developer.tmsapi.com/](http://developer.tmsapi.com/)
    * [http://www.omdbapi.com/](http://www.omdbapi.com/)
  * The nightly backend job stores the movie data in AWS's No-SQL DynamoDB
  * The frontend of this site uses DynamoDB's JS API to directly query the movie times and theaters
