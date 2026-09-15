import React, { useEffect, useState } from "react";
import {
  supabase,
  ensureVisitorSession,
} from "../supabaseClient";

import {
  TrendingUp,
  Wallet,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Trophy,
} from "lucide-react";


export default function PaperTrading() {

  const [session, setSession] = useState(null);

  const [loading, setLoading] = useState(false);

  const [symbol, setSymbol] = useState("AAPL");

  const [quote, setQuote] = useState(null);

  const [account, setAccount] = useState(null);

  const [positions, setPositions] = useState([]);

  const [orders, setOrders] = useState([]);

  const [quantity, setQuantity] = useState(1);

  const [side, setSide] = useState("buy");

  const [message, setMessage] = useState("");



  /*
    Start visitor session
  */

  useEffect(() => {

    initialize();

  }, []);



  async function initialize() {

    try {

      const userSession =
        await ensureVisitorSession();


      setSession(userSession);


      await loadAccount(
        userSession.user.id
      );


      await loadPortfolio(
        userSession.user.id
      );


      await loadOrders(
        userSession.user.id
      );


      await getQuote();


    } catch(error){

      console.error(
        error
      );

      setMessage(
        error.message
      );

    }

  }




  /*
    Load paper account
  */

    async function loadAccount(userId) {

  const {
    data,
    error
  } = await supabase
    .from("paper_accounts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();


  if(error){

    console.error(
      "Account loading error:",
      error
    );

    return;

  }


  if(!data){

    const {
      data:newAccount,
      error:createError
    } = await supabase
      .from("paper_accounts")
      .insert({

        user_id:userId,

        starting_cash:100000,

        cash_balance:100000

      })
      .select()
      .single();


    if(createError){

      console.error(
        "Account creation failed:",
        createError
      );

      return;

    }


    setAccount(
      newAccount
    );


    return;

  }


  setAccount(data);

}
//   async function loadAccount(userId){

//     const {
//       data,
//       error
//     } = await supabase
//       .from("paper_accounts")
//       .select("*")
//       .eq(
//         "user_id",
//         userId
//       )
//       .single();


//     if(error){

//       console.log(
//         "No account yet"
//       );

//       return;

//     }


//     setAccount(data);

//   }





  /*
    Load positions
  */

  async function loadPortfolio(userId){

    const {
      data,
      error
    } = await supabase
      .from("paper_positions")
      .select("*")
      .eq(
        "user_id",
        userId
      )
      .order(
        "created_at",
        {
          ascending:false
        }
      );


    if(error){

      console.error(
        error
      );

      return;

    }


    setPositions(
      data || []
    );

  }





  /*
    Load trade history
  */

  async function loadOrders(userId){

    const {
      data,
      error
    } = await supabase
      .from("paper_orders")
      .select("*")
      .eq(
        "user_id",
        userId
      )
      .order(
        "created_at",
        {
          ascending:false
        }
      )
      .limit(10);


    if(error){

      console.error(
        error
      );

      return;

    }


    setOrders(
      data || []
    );

  }





  /*
    Get live Alpaca quote
  */

  async function getQuote(){


    try {


      setLoading(true);


      await ensureVisitorSession();



      const {
        data,
        error
      } =
      await supabase.functions.invoke(
        "stock-quote",
        {
          body:{
            symbol
          }
        }
      );


      if(error){

        throw error;

      }



      setQuote(
        data
      );


    }
    catch(error){

      console.error(
        error
      );


      setMessage(
        error.message
      );

    }
    finally{

      setLoading(false);

    }

  }





  /*
     Execute paper trade
  */


  async function executeTrade(){


    try{


      setLoading(true);

      setMessage("");



      await ensureVisitorSession();



      const {
        data,
        error
      } =
      await supabase.functions.invoke(
        "paper-trade",
        {

          body:{


            assetType:
              "stock",


            symbol:
              symbol,


            side,


            quantity:
              Number(quantity)


          }

        }
      );



      if(error){

        throw error;

      }



      if(data?.error){

        throw new Error(
          data.error
        );

      }



      setMessage(
        "Trade executed successfully"
      );



      await initialize();



    }
    catch(error){

      console.error(
        error
      );


      setMessage(
        error.message
      );

    }
    finally{

      setLoading(false);

    }

  }
}