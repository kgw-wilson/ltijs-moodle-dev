import { Provider, IdToken, Grade } from "ltijs";

async function handleGradeSubmission(
  ltiProvider: typeof Provider,
  idtoken: IdToken,
  score: number,
): Promise<any> {
  const gradeObj: Grade = {
    userId: idtoken.user,
    scoreGiven: score,
    scoreMaximum: 100,
    activityProgress: "Completed",
    gradingProgress: "FullyGraded",
  };

  let lineItemId = idtoken.platformContext.endpoint.lineitem;
  if (!lineItemId) {
    const response = await ltiProvider.Grade.getLineItems(idtoken, {
      resourceLinkId: true,
    });
    const lineItems = response.lineItems;

    if (lineItems.length === 0) {
      console.log("Creating new line item");
      const newLineItem = {
        scoreMaximum: 100,
        label: "Grade",
        tag: "grade",
        resourceLinkId: idtoken.platformContext.resource.id,
      };
      const lineItem = await ltiProvider.Grade.createLineItem(
        idtoken,
        newLineItem,
      );
      lineItemId = lineItem.id;
    } else {
      lineItemId = lineItems[0].id;
    }
  }

  const responseGrade = await ltiProvider.Grade.submitScore(
    idtoken,
    lineItemId,
    gradeObj,
  );
  return responseGrade;
}

export { handleGradeSubmission };
