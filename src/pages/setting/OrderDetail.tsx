import { Button } from "@/components/ui/button";
import { useGetAPI, usePostApi } from "@/lib/service";
import { FormatToIDR } from "@/lib/utils";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import { ChevronLeft } from "@mui/icons-material";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { AuthContext } from "@/app/AuthContext";
import { formatDateLL } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/features/hook";
import { random, setRand } from "@/lib/features/globalReducer";
import { Link } from "react-router-dom";
import CountdownTimer from "../../components/order/Countdown";
import UploadProvePayment from "@/components/order/UploadProvePayment";
import { OrderStatus } from "@/components/Component";

const OrderDetail = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const rand = useAppSelector(random);

  const { id } = useParams();
  const { bearer } = useContext(AuthContext);
  const { data: order, isFetched, refetch } = useGetAPI(`/api/order/id/${id}`, `order-${id}`, bearer);
  const { mutate: transaction, data: transactionOrder, isSuccess } = usePostApi(`api/order/transaction`, bearer);
  const { mutate: cancelTransaction } = usePostApi(`api/order/transaction-cancel`, bearer);

  const [token, setToken] = useState("");

  const countDay = isFetched && Math.round(Math.abs(order.start_date - order.end_date) / (24 * 36 * 1e5));
  const idString = JSON.stringify(id);

  const handleTransaction = () => {
    const payload = {
      orderId: id,
    };
    transaction(payload);
  };

  const handleTransacionCancel = () => {
    const payload = {
      orderId: id,
    };
    cancelTransaction(payload);
    setTimeout(() => {
      dispatch(setRand(Math.random()));
    }, 100);
  };

  useEffect(() => {
    if (isSuccess) {
      localStorage.setItem("orderId", idString);
      setToken(transactionOrder.data.token);
      if (token) {
        window.snap.pay(transactionOrder.data.token);
      }
    }
    refetch();
  }, [isSuccess, order, token, rand]);

  useEffect(() => {
    const midtransUrl = import.meta.env.VITE_MIDTRANS_URL;
    let script = document.createElement("script");
    script.src = midtransUrl;
    script.setAttribute("data-client-key", import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="border rounded-xl xl:h-full">
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
          <div className="flex flex-col xl:flex-row-reverse">
            <div>
              <Link to={`/room/${order.room.id}`}>
                <img className="w-full xl:max-w-[600px] rounded-xl" src={order.room.image_url} alt="" />
              </Link>
              <Dialog>
                <DialogTrigger
                  className={`${
                    order.status === "unconfirm" || order.status === "success" || order.status === "rejected"
                      ? ""
                      : "hidden"
                  } text-center text-base italic w-full pt-4`}
                >
                  <span className="underline font-thin cursor-pointer mx-auto">lihat bukti transaksi</span>
                </DialogTrigger>
                <DialogContent>
                  <img src={order.image_url} className="rounded-lg" />
                </DialogContent>
              </Dialog>
            </div>
            <div className="w-full relative mt-12 xl:mt-0 xl:pr-8 space-y-4 font-thin">
              <div className="flex justify-between">
                <p className="font-normal">ORDER ID</p>
                {order.status !== "unpaid" ? (
                  <OrderStatus status={order.status} />
                ) : (
                  <CountdownTimer orderDate={order.createdAt} />
                )}
              </div>

              <Link to={`/room/${order.room.id}`}>
                <p className="font-bold text-sm">{order.id}</p>
              </Link>

              <div className="flex justify-between">
                <p>Total harga</p>
                <p>{FormatToIDR(order.total_price)}</p>
              </div>
              <div className="flex justify-between">
                <p>Tamu</p>
                <p>{order.guest} orang</p>
              </div>
              <div className="flex justify-between">
                <p>Lama menginap</p>
                <p>{countDay} malam</p>
              </div>
              <div className="flex justify-between">
                <p>Tanggal Check-In</p>
                <p>{formatDateLL(order.start_date)}</p>
              </div>
              <div className="flex justify-between">
                <p>Tanggal Check-out</p>
                <p>{formatDateLL(order.end_date)}</p>
              </div>
              <div
                className={`${
                  order.status === "expired" ||
                  order.status === "cancel" ||
                  order.status === "unconfirm" ||
                  order.status === "success"
                    ? "hidden"
                    : ""
                } flex flex-col space-y-2 text-lg font-normal`}
              >
                <Button
                  className={`${order.status === "rejected" ? "hidden" : ""}`}
                  onClick={() => handleTransaction()}
                >
                  Bayar
                </Button>
                <Dialog>
                  <DialogTrigger className={` bg-[#F5F5F5] rounded-lg py-2 px-4`}>Upload Bukti Bayar</DialogTrigger>
                  <UploadProvePayment orderId={String(id)} />
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger
                    className={`${order.status === "unpaid" ? "" : "hidden"} bg-[#D80032] text-white p-2 rounded-lg`}
                  >
                    Batalkan Pesanan
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogTitle>Kamu yakin ingin membatalkan pesanan?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Dengan membatalkan pesanan maka status kamar akan dalam keadaan tersedia dan pengguna lain dapat
                      melakukan pemesanan
                    </AlertDialogDescription>
                    <div className="flex justify-end space-x-4">
                      <AlertDialogCancel>Kembali</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-[#D80032] hover:bg-[#D80032]/80 text-base"
                        onClick={() => handleTransacionCancel()}
                      >
                        Konfirmasi
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="h-10"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
