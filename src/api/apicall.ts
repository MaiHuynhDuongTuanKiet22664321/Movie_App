const apikey : string = '9cc4c7b681622f1ac6abb9bae36d6f86';
export const baseImagePath = (size : string, path : string)=>{
    return `https://image.tmdb.org/t/p/${size}${path}`
}
export const nowPlayingMovie : string = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apikey}`;
export const upComingMovie : string = `https://api.themoviedb.org/3/movie/upcoming?api_key=${apikey}`;
export const popularMovie: string = `https://api.themoviedb.org/3/movie/popular?api_key=${apikey}`;
export const searchMovies = (keyWork : string) =>{
    return `https://api.themoviedb.org/3/search/movie?api_key=${apikey}&query=${keyWork}`
}

export const movieDetails = (id : number) =>{
    return `https://api.themoviedb.org/3/movie/${id}?api_key=${apikey}`
}
export const moviecastDetails = (id : number) =>{
    return `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apikey}`
}
 
