import { Button } from "@/components/ui/button";
import { useGetAPI, usePostApi } from "@/lib/service";
import { FormatToIDR } from "@/lib/utils";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import { ChevronLeft } from "@mui/icons-material";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import CountdownTimer from "../../components/order/Countdown";
import UploadProvePayment from "@/components/order/UploadProvePayment";
import { AuthContext } from "@/app/AuthContext";

const OrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { bearer } = useContext(AuthContext);
  const { data: order, isFetched, refetch } = useGetAPI(`/api/order/id/${id}`, `order-${id}`, bearer);
  const { mutate, data: transactionOrder, isSuccess } = usePostApi(`api/order/transaction`, bearer);

  const [token, setToken] = useState("");

  const checkIn = isFetched && new Date(order.start_date).toLocaleDateString();
  const checkOut = isFetched && new Date(order.end_date).toLocaleDateString();
  const countDay = isFetched && Math.round(Math.abs(order.start_date - order.end_date) / (24 * 36 * 1e5));

  const transaction = () => {
    const payload = isFetched && {
      orderId: id,
    };
    mutate(payload);
  };

  useEffect(() => {
    if (isSuccess) {
      setToken(transactionOrder.data.token);
      if (token) {
        window.snap.pay(transactionOrder.data.token);
      }
    }
    refetch();
  }, [isSuccess, order, token]);

  useEffect(() => {
    const midtransUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    const midtransClientKey = "SB-Mid-client-ua4G3MNRZB0VnKx_";
    let script = document.createElement("script");
    script.src = midtransUrl;
    script.setAttribute("data-client-key", midtransClientKey);
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="border rounded-xl md:h-full">
      {isFetched && (
        <div className="px-12 pt-4">
          <div className="flex relative items-center mb-4">
            <div
              className="absolute left-[-40px] hover:bg-slate-100 rounded-full cursor-pointer"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft fontSize="large" />
            </div>
            <span className="text-2xl">kembali</span>
          </div>
          <div className="flex flex-col md:flex-row-reverse">
            <div>
              <img className="w-full rounded-xl" src={order.room.image_url} alt="" />
              <Dialog>
                <DialogTrigger className={`${order.status === "unconfirm" ? "" : "hidden"} text-center w-full mt-4`}>
                  <span className="underline font-thin cursor-pointer mx-auto">lihat bukti transaksi</span>
                </DialogTrigger>
                <DialogContent>
                  <img src={order.image_url} />
                </DialogContent>
              </Dialog>
            </div>
            <div className="w-full relative mt-12 md:mt-0 md:pr-8">
              <div className="flex justify-end">
                {order.status === "unpaid" ? <CountdownTimer orderDate={order.createdAt} /> : ""}
              </div>
              <div>
                <p className="text-xl">ORDER ID</p>
                <p className="text-sm">{order.id}</p>
              </div>
              <div className="flex justify-between my-4"></div>
              <div className="flex justify-between my-4">
                <p className="text-xl font-thin">Total harga</p>
                <p className="text-xl font-thin">{FormatToIDR(order.total_price)}</p>
              </div>
              <div className="flex justify-between my-4">
                <p className="text-xl font-thin">Tamu</p>
                <p className="text-xl font-thin">{order.guest} orang</p>
              </div>
              <div className="flex justify-between my-4">
                <p className="text-xl font-thin">Lama menginap</p>
                <p className="text-xl font-thin">{countDay} malam</p>
              </div>
              <div className="flex justify-between my-4">
                <p className="text-xl font-thin">Tanggal Check-In</p>
                <p className="text-xl font-thin">{checkIn}</p>
              </div>
              <div className="flex justify-between my-4">
                <p className="text-xl font-thin">Tanggal Check-out</p>
                <p className="text-xl font-thin">{checkOut}</p>
              </div>
              <div className="text-center">
                <Button className={`${order.status !== "unpaid" ? "hidden" : ""}`} onClick={() => transaction()}>
                  Bayar Sekarang
                </Button>
                <Dialog>
                  <DialogTrigger className={`${order.status !== "unconfirm" ? "hidden" : ""}`}>
                    Upload Bukti Bayar
                  </DialogTrigger>
                  <UploadProvePayment orderId={String(id)} />
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
