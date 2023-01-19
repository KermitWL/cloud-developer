import express from 'express';
import { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';
import { readdirSync } from 'fs';
import { URL } from 'url';


(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());


  // delete all temp files on finishing a response
  app.use(function(req: Request, res: Response, next: NextFunction){
    res.on('finish', function() {
      const outpath: string = __dirname + "/util/tmp/";
      const tempFiles: string[] = readdirSync(outpath);
      for (var i = 0; i < tempFiles.length; i++) {
        tempFiles[i] = outpath + tempFiles[i];
      } 
      deleteLocalFiles(tempFiles);
    });
    next();
  });

  // image filtering
  app.get('/filteredimage/', async (req: Request, res: Response) => {
    let imageURL : string = req.query["image_url"].toString();
    if (!imageURL) {
        res.status(400).send("image_url not set");
        return;
    }

    try {
      const testURL = new URL(imageURL.toString());
    } catch (error) {
      res.status(400).send("not a valid url: " + imageURL);
      return;
    }

    var filteredImage = undefined;
    try {
      filteredImage = await filterImageFromURL(imageURL.toString());
    } catch (error) {
      console.log(error);
      res.status(400).send("could not get image from url " + imageURL);
      return;
    }
    
    if (!filteredImage) {
      res.status(400).send("image filtering failed");
      return;
    }

    res.status(200).sendFile(filteredImage);
});

  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req: Request, res: Response ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();