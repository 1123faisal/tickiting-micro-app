import { useRouter } from "next/router";
import useRequest from "../../hooks/use-request";

const TicketShow = ({ ticket }) => {
  const router = useRouter();

  const { doRequest, errors } = useRequest({
    url: "/api/orders",
    body: {
      ticketId: ticket.id,
    },
    method: "post",
    onSuccess: (order) => router.push(`/orders/${order.id}`),
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button onClick={(e) => doRequest()} className="btn btn-primary">
        Purchase
      </button>
    </div>
  );
};

TicketShow.getInitialProps = async (ctx, client) => {
  const { ticketId } = ctx.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return { ticket: data };
};

export default TicketShow;
