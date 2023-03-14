// var tweets = document.getElementsByClassName("css-901oao r-1nao33i r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-bnwqim r-qvutc0")
//var tweets = document.getElementsByClassName("css-1dbjc4n r-1iusvr4 r-16y2uox r-1777fci r-kzbkwu");

let dot = `<div dir="ltr" aria-hidden="true" class="css-901oao r-1bwzh9t r-1q142lx r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-s1qlax r-qvutc0"><span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">·</span></div>`

setInterval(() => {
	process_tweets(filter_cached(get_tweet_data()), async data => await data.forEach(async data => {await set_emoji(data)}));
}, 1000);

get_tweet_data = () => [...document.querySelectorAll('article')].map(e => e.getElementsByClassName("css-901oao r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-bnwqim r-qvutc0")).filter(e => e.length > 0).map(e => {
    const article_element = e[0].closest("article");
    return ({
		header: article_element.getElementsByClassName("css-1dbjc4n r-1awozwy r-18u37iz r-1wbh5a2 r-dnmrzs r-1ny4l3l")[0],
        text: article_element.getElementsByClassName("css-901oao r-1nao33i r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-bnwqim r-qvutc0")[0].innerText,
        element: article_element,
		id: get_tweet_id(article_element)
    })
});


get_tweet_id = el => {
    let id_ = "";
    const a_elems = [...el.getElementsByTagName("a")].map(e => e.href);
    for(let i = 0; i < a_elems.length; i++){
        const regsult = a_elems[i].match(/.*\/status\/(\d+)?.*/);
        if(regsult && regsult.length > 1){
            id_ = regsult[1];
            break;
        }
    }
    return id_;
}

filter_cached = (arr) => arr.filter(e => !e.element.getAttribute("data-cached"))

process_tweets = async (tweets, callback) => {
	if(tweets.length>0){
		var res = await fetch("https://tweetsen.uw.r.appspot.com/api/sentiment-score", {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json'
			},
			body: JSON.stringify(tweets.map(e => ({id:e.id, tweet_text:e.text})))
		})
        res = await res.json()
        tweets.forEach(el => el.element.setAttribute("data-cached", true));
        out_json = await tweets.map(el => Object.assign(el,{mood:res[el.id]['detected_mood']}))
		console.log(out_json);
		if(callback) await callback(out_json);
	}	
}

set_emoji = (el) => {
	console.log('inside callback '+el)
	el.element.setAttribute("emoji-set", true);
	emoji = "";
	if(el.mood.localeCompare("POSITIVE")==0)
		emoji = '🙂'
	else if(el.mood.localeCompare("NEGATIVE")==0)
		emoji = '😞'
	else 
		emoji = '😐'
	el.header.innerHTML+= ` `+dot+` 
	<div dir="ltr" class="css-901oao css-1hf3ou5 r-1bwzh9t r-18u37iz r-37j5jr r-1wvb978 r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-qvutc0"><span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">Detected Mood : `+emoji+`</span></div>`
}