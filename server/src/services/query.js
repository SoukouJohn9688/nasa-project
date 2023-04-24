
const DEFAULT_PAGE_NUMBER=1;
const DEFAULT_PAGE_LIMIT=0; // with 0, mongo will return all docs on the same page

function getPagination(query){
    const page=Math.abs(query.page || DEFAULT_PAGE_NUMBER);
    const limit=Math.abs(query.limit);
    const skip=(page-1)*limit;


    return{
        skip,
        limit,
    }
}

module.exports={
    getPagination,
}