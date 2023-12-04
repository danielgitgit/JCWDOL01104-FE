import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useContext, useState } from "react";
import { FormatToIDR } from "@/lib/utils";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTrigger } from "../ui/dialog";
import { AuthContext } from "@/app/AuthContext";
import Login from "../auth/LoginDialog";
import { Link } from "react-router-dom";

interface IDataProps {
  data: {
    id: number;
    name: string;
    price: string;
    description: string;
    person: number;
    image_url: string;
  };
}

const Room: React.FC<IDataProps> = ({ data }) => {
  const { isLogin } = useContext(AuthContext);
  const [fullDescription, setFullDescription] = useState(false);
  const [page, setPage] = useState(1);

  return (
    <Dialog>
      <Card className="mb-4 shadow-lg">
        <div className="flex flex-col xl:flex-row">
          <img className="h-[200px] rounded-xl" src={data.image_url} />
          <div className="w-full">
            <CardHeader>
              <div className="flex justify-between items-end">
                <CardTitle>{data.name}</CardTitle>
                <CardDescription>{FormatToIDR(Number(data.price))}/malam</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {data.description.length > 20 ? (
                fullDescription ? (
                  <div>
                    {data.description}
                    <span className="font-thin cursor-pointer" onClick={() => setFullDescription(false)}>
                      sembunyikan
                    </span>
                  </div>
                ) : (
                  <div>
                    {data.description.substring(0, 80)}
                    <span className="font-thin cursor-pointer" onClick={() => setFullDescription(true)}>
                      {" "}
                      ...selanjutnya
                    </span>
                  </div>
                )
              ) : (
                <p> {data.description}</p>
              )}
            </CardContent>
            <CardFooter className="font-thin flex justify-between items-end">
              <p>Maksimal tamu {data.person}</p>
              <Link to={`/room/${data.id}`}>
                <Button size={"sm"}>Selanjutnya</Button>
              </Link>
            </CardFooter>
          </div>
        </div>
      </Card>
    </Dialog>
  );
};

export default Room;