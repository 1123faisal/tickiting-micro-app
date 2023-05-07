import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ProductDisplay = ({ order }) => (
  <section>
    <div className="product">
      {/* <img
        src="https://i.imgur.com/EHyR2nP.png"
        alt="The cover of Stubborn Attachments"
      /> */}
      <div className="description">
        <h3>{order.ticket.title}</h3>
        <h5>{order.ticket.price}</h5>
      </div>
    </div>
    <form action="/api/payments/session" method="POST">
      <input type="hidden" name="orderId" value={order.id} />
      <button type="submit">Checkout</button>
    </form>
  </section>
);

const Message = ({ message }) => (
  <section>
    <p>{message}</p>
  </section>
);

const OrderShow = ({ order, currentUser }) => {
  const [msLeft, setMsTime] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const findTimeLeft = () => {
      setMsTime(Math.round((new Date(order.expiresAt) - new Date()) / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const [message, setMessage] = useState();

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      // this action depends on developer
      setMessage("Order placed! You will receive an email confirmation.");
      router.push("/orders");
    }

    if (query.get("canceled")) {
      setMessage(
        "Order canceled -- continue to shop around and checkout when you're ready."
      );
    }
  }, []);

  let content = message ? (
    <Message message={message} />
  ) : (
    <ProductDisplay order={order} />
  );

  if (message) {
    return (
      <div>
        <Message message={message} />
        <Link href="/">Continue Shopping.</Link>
      </div>
    );
  }

  if (msLeft <= 0 && !message) {
    return <div>Order Expired.</div>;
  }

  return (
    <div>
      <div>Time left to pay: {msLeft} seconds.</div>
      {order && content}
    </div>
  );
};

OrderShow.getInitialProps = async (ctx, client) => {
  const { orderId } = ctx.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
