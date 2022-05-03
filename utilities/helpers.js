exports.toTitleCase = (str) => {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
}

exports.calcNextPaymentDate = (interval) => {
	var date = '';
	switch (interval) {
	  case 'daily':
		date = new Date(Date.now() + 24 * 60 * 60 * 1000);
		break;
		
	  case 'hourly':
		date = new Date(Date.now() + 60 * 60 * 1000);
		break;
	  
	  case 'weekly':
		date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
		break;
  
	  case 'bi-weekly':
		date = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
		break;
  
	  case 'monthly':
		date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
	  break;
	
	  default:
		break;
	}
  
	return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  
}
  
exports.dayDiff = (lodgeEndDate, lodgeStartDate) => {
	const date1 = new Date(lodgeStartDate);
	const date2 = new Date(lodgeEndDate);
	return (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24) + 1
}

exports.round5 = (x) => Math.ceil(x/100)*100

exports.round2 = (x) => Math.ceil(x/2)*2