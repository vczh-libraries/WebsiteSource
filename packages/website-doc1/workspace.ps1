code .;
..\..\..\GacUI\Test\GacUISrc\GacUISrc.sln
pushd ..\..\..\Release
# code .
cd SampleForDoc\GacUI
# .\GacUI.sln
# code .
popd
Start-Process http://localhost:8080/doc/current/gacui/components/controls/home.html;
npm run start;
