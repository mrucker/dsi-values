function getRecommendations(algorithm, date, theaters, movies, times, history) {

    if(algorithm == 0) {
      return getRandomRecommendations(date, theaters, movies, times);  
    }
    else {
        return projectionRecommendation();
    }    
    
}