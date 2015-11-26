<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="index.aspx.cs" Inherits="SoftLine.UZ.UploadPriceList.index" Async="true"%>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
    <div style="height: 78px; width: 304px">
    
        <asp:Label ID="Label1" runat="server" Text="Загрузка Прайс Листа"></asp:Label>
        <br />
        <asp:FileUpload ID="FileUpload" runat="server" Height="25px" Width="300px" />
        <br />
            <asp:Button ID="Button" runat="server" Text="Загрузить" OnClick="UploadFile" />
        </div>
        <p>
            <asp:Label ID="Result" runat="server" Visible="False"></asp:Label>
        </p>
    </form>
</body>
</html>
