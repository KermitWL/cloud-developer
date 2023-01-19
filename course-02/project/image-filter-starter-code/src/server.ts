import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
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
  app.use(function(req, res, next){
    res.on('finish', function() {
      const outpath = "/util/tmp/";
      const tempFiles = readdirSync(__dirname + outpath);
      for (var i = 0; i < tempFiles.length; i++) {
        tempFiles[i] = __dirname + outpath + tempFiles[i];
      } 
      deleteLocalFiles(tempFiles);
    });
    next();
  });

  // image filtering
  app.get('/filteredimage/', async (req, res) => {
    let imageURL = req.query["image_url"];
    if (!imageURL) {
        res.status(400).send("image_url not set");
        return;
    }

    try {
      const testURL = new URL(imageURL.toString());
    } catch (error) {
      res.status(400).send("no valid url");
      return;
    }

    var filteredImage = undefined;
    try {
      filteredImage = await filterImageFromURL(imageURL.toString());
    } catch (error) {
      res.status(400).send("could not get image from url " + imageURL);
      return;
    }
    
    if (!filteredImage) {
      res.status(400).send("image filtering failed");
      return;
    }

    res.status(200).sendFile(filteredImage);
});

  /**************************************************************************** */

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();