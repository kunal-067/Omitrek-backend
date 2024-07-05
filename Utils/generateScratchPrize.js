function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getIndex(length){
    return Math.floor(Math.random()*length);
}
const rewards = {
    rew0:[0,0,3,4,0,6,0,5,0,7,0,2,,0,3,4,0],
    rew20:[0,10,14,21,23,27,26,0,54,53,55,60,59,21,24,32,33,34,36,37,41,42,43,15,21,33,32,37,36,42,41],
    rew100:[0,80,81,82,67,100,101,106,105,200,201,187,196,197,154,123,147,145,234,222,221,0,199,201,202,203,300,296,297,267,287,243,242,241,221,247],
    rew500:[0,297,287,267,235,345,678,800,745,746,455,459,456,400,301,309,345,457,397,0,0,771,776,701,704,708,458,568,598,547,387,0,589,590],
    rew1000:[0,589,678,502,201,307,200,501,247,256,789,1100,1201,1500,1001,879,675,0,777,789,804,890,569,789,590,999,837,1000,0,879,827,888,589,538]
}

function GeneratePrize(balance, reward) {
    let win;
    
    if(balance > 2000){
        const index = getIndex(rewards.rew0.length);
        win = rewards.rew0[index];
    }else{
        const index = getIndex(rewards[reward]?.length);
        win = rewards[reward][index];

        const incrmentedBalance = balance+reward
        if(incrmentedBalance > 2100){
            win = win - (incrmentedBalance - 2100)
        }

    }
    return win
}

module.exports = {GeneratePrize}

console.log('prize', GeneratePrize(201,'rew1000'))