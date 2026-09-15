import React, { useEffect, useState } from "react";
import {
  supabase,
  ensureVisitorSession,
} from "../supabaseClient";

import {
  Wallet,
  Search,
  Activity,
  Trophy,
} from "lucide-react";


export default function PaperTrading() {


  const [loading,setLoading] = useState(false);

  const [symbol,setSymbol] = useState("AAPL");

  const [quote,setQuote] = useState(null);

  const [account,setAccount] = useState(null);

  const [positions,setPositions] = useState([]);

  const [orders,setOrders] = useState([]);

  const [quantity,setQuantity] = useState(1);

  const [side,setSide] = useState("buy");

  const [message,setMessage] = useState("");



  useEffect(()=>{

    initialize();

  },[]);




  async function initialize(){

    try{


      const session =
        await ensureVisitorSession();



      const userId =
        session.user.id;



      await loadAccount(userId);


      await loadPortfolio(userId);


      await loadOrders(userId);


      await getQuote();



    }
    catch(error){

      console.error(error);

      setMessage(error.message);

    }

  }





  async function loadAccount(userId){


    const {
      data,
      error
    } =
    await supabase
      .from("paper_accounts")
      .select("*")
      .eq(
        "user_id",
        userId
      )
      .maybeSingle();



    if(error){

      console.error(
        error
      );

      return;

    }




    if(!data){


      const {
        data:newAccount,
        error:createError
      }
      =
      await supabase
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







  async function loadPortfolio(userId){


    const {
      data,
      error
    }
    =
    await supabase
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

      console.error(error);

      return;

    }


    setPositions(
      data || []
    );

  }







  async function loadOrders(userId){


    const {
      data,
      error
    }
    =
    await supabase
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

      console.error(error);

      return;

    }


    setOrders(
      data || []
    );


  }








  async function getQuote(){


    try{


      setLoading(true);



      await ensureVisitorSession();




      const {
        data,
        error
      }
      =
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



      setQuote(data);



    }
    catch(error){

      console.error(error);

      setMessage(
        error.message
      );

    }
    finally{

      setLoading(false);

    }


  }









  async function executeTrade(){


    try{


      setLoading(true);

      setMessage("");



      await ensureVisitorSession();




      const {
        data,
        error
      }
      =
      await supabase.functions.invoke(

        "paper-trade",

        {

          body:{


            assetType:"stock",

            symbol,

            side,

            quantity:Number(quantity)


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

      console.error(error);

      setMessage(
        error.message
      );


    }
    finally{

      setLoading(false);

    }


  }







  return (

<div className="
min-h-screen
bg-gradient-to-br
from-purple-950
via-slate-950
to-black
p-6
text-white
">


<div className="max-w-7xl mx-auto">



<h1 className="text-4xl font-bold mb-2">
TO Analytics Trading Lab
</h1>


<p className="text-purple-300 mb-8">
Practice stock trading with virtual money
</p>





<div className="grid md:grid-cols-3 gap-6 mb-8">



<div className="bg-white/10 rounded-2xl p-6 backdrop-blur-xl">

<Wallet className="text-purple-400 mb-3"/>

<p>
Cash Balance
</p>


<h2 className="text-3xl font-bold">

$
{
account?.cash_balance
?
Number(account.cash_balance)
.toLocaleString()
:
"100,000"
}

</h2>

</div>





<div className="bg-white/10 rounded-2xl p-6 backdrop-blur-xl">

<Activity className="text-green-400 mb-3"/>

<p>
Positions
</p>


<h2 className="text-3xl font-bold">

{positions.length}

</h2>


</div>





<div className="bg-white/10 rounded-2xl p-6 backdrop-blur-xl">

<Trophy className="text-yellow-400 mb-3"/>

<p>
Trades
</p>


<h2 className="text-3xl font-bold">

{orders.length}

</h2>


</div>



</div>







<div className="bg-white/10 rounded-2xl p-6 mb-8">


<h2 className="text-xl font-bold mb-4">
Market Search
</h2>



<div className="flex gap-3">


<input

value={symbol}

onChange={
(e)=>
setSymbol(
e.target.value.toUpperCase()
)
}

className="
flex-1
bg-black/40
border
border-white/20
rounded-xl
px-4
py-3
"

/>


<button

onClick={getQuote}

className="
bg-purple-600
px-6
rounded-xl
"

>

<Search/>

</button>


</div>




{
quote &&

<div className="mt-6">


<h3 className="text-3xl font-bold">

{quote.symbol}

</h3>


<p className="text-green-400 text-2xl">

$
{
Number(
quote.marketPrice
)
.toFixed(2)
}

</p>


</div>

}



</div>







<div className="bg-white/10 rounded-2xl p-6">


<h2 className="text-xl font-bold mb-5">
Execute Paper Trade
</h2>




<div className="flex flex-wrap gap-4">



<input

type="number"

value={quantity}

onChange={
(e)=>
setQuantity(
e.target.value
)
}

className="
w-32
bg-black/40
border
border-white/20
rounded-xl
px-4
py-3
"

/>




<button

onClick={()=>
setSide("buy")
}

className="
bg-green-600
px-6
rounded-xl
"

>

BUY

</button>





<button

onClick={()=>
setSide("sell")
}

className="
bg-red-600
px-6
rounded-xl
"

>

SELL

</button>






<button

disabled={loading}

onClick={executeTrade}

className="
bg-purple-600
px-8
rounded-xl
font-bold
"

>

{
loading
?
"Processing..."
:
"Trade"
}


</button>



</div>




{
message &&

<p className="mt-5 text-purple-300">

{message}

</p>

}



</div>




</div>


</div>


  );


}