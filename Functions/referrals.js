 const User = require('../Models/user.model')

 async function addRefData(userData, userReferredBy, level = 1) {
     if (userReferredBy == "" && level > 5) {
         return console.log('either empty referral code or level is high')
     }

     try {
         let refByUserdata = await User.findOne({
             referralCode: userReferredBy
         });
         if (!refByUserdata) {
             throw new Error("Referred user not found");
         }
         const addRefD = {
             _id: userData._id,
             date: userData.registrationDate,
             name: userData.name,
             email: userData.email,
             position: userData.position,
             level: level
         };

         refByUserdata.referrals.push(addRefD);
         await refByUserdata.save();
         const recUserRefby = refByUserdata.referredBy;
         // Recursively call the function for the next level
         return addRefData(userData, recUserRefby, level + 1);
     } catch (error) {
         console.error("Error updating referral data:", error);
     }
 }


 /**
  * Creates a referral tree for a user in the system.
  * @param {string} userReferredBy - The referral code of the user who referred the new user.
  * @param {object} userData - The data of the new user.
  * @param {string} position - The position of the new user in the referral tree.
  * @returns {Promise<boolean>} - A Promise indicating the success of the operation.
  */
 async function createRefTree(userReferredBy, userData, position) {
     if (userReferredBy == "") {
         return console.log('empty referral code')
     }

     try {
         const userRef = await User.findOne({
             referralCode: userReferredBy
         });
         let treeArray, appender, appendData, isAppenderUser;

         // If userRef exists, proceed with building the tree
         if (userRef) {
             treeArray = userRef.treeData;
             await checkAppendTree(userRef._id);
         }

         // Function to check and append the tree recursively
         async function checkAppendTree(directRefBy) {
             // Filter direct referrals matching the specified position
             const directRef = treeArray.filter(elem => elem.upMember.equals(directRefBy) && elem.position === position);

             // If no direct referrals found at the specified position, append the new user
             if (directRef.length === 0) {
                 // Prepare data for appending
                 appendData = {
                     user: userData._id,
                     name: userData.name,
                     upMember: directRefBy,
                     position: position
                 };

                 // Append to the tree array and save
                 treeArray.push(appendData);
                 await userRef.save();

                 // Determine if the appender is the userRef
                 isAppenderUser = appendData.upMember.equals(userRef._id);
                 appender = appendData.upMember;

                 // Find the user with long referral tree
                 const longReftree = await User.findOne({
                     'treeData.user': appender
                 });

                 if (longReftree) {
                     const longTreeArray = longReftree.treeData;
                     const appenderIndex = longTreeArray.findIndex(elem => elem.user.equals(appender));
                     let upMember = !isAppenderUser ? longTreeArray[appenderIndex].user : longTreeArray[appenderIndex].upMember;

                     // Check if the user is not already in the long referral tree
                     const checkInLongTree = longTreeArray.find(elem => elem.user.equals(appendData.user));
                     if (!checkInLongTree) {
                         longTreeArray.push(appendData);
                         await longReftree.save();
                     }

                     // Traverse up the long referral tree and append the user
                     while (upMember.toString() !== longReftree._id.toString()) {
                         if (upMember.toString() === appendData.upMember.toString()) {
                             return;
                         }
                         const upAppender = await User.findById(upMember);
                         const upAppenderArray = upAppender.treeData;
                         upAppenderArray.push(appendData);
                         await upAppender.save();

                         const upperMember = longTreeArray.find(elem => elem.user.equals(upMember));
                         if (upperMember) {
                             upMember = upperMember.upMember;
                         } else {
                             upMember = longReftree._id;
                         }
                     }
                 }
                 return true;
             } else {
                 // If direct referrals found at the specified position, recursively check and append
                 const lowerRef = directRef[0];
                 await checkAppendTree(lowerRef.user);
             }
         }
     } catch (error) {
         console.error('Error in creating referral tree:', error);
         throw error;
     }
 }




 module.exports = {
     addRefData,
     createRefTree
 }