package controller;

import mapper.AccountMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import service.AccountInfo;
import util.JSONUtil;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequestMapping("/ajax")
@Controller
public class AjaxController {
    @Autowired
    private AccountMapper accountMapper;

    @RequestMapping(value = "/{bean}", method = RequestMethod.POST, produces = "application/json;charset=UTF-8")
    public void addAccount(@PathVariable String bean, HttpServletRequest request, HttpServletResponse response) {
        Map<String, Object> returnValue;
        if (bean.equals("add")) {
            returnValue = OperAdd(request.getParameterMap());
        }
        else if (bean.equals("querynames"))
        {
            returnValue = OperQueryNames(request.getParameterMap());
        }
        else if (bean.equals("queryAccountInfo"))
        {
            returnValue = OperQueryPassword(request.getParameterMap());
        }
        else if (bean.equals("updateAccountInfo"))
        {
            returnValue = OperUpdateAccountInfo(request.getParameterMap());
        }
        else
        {
            returnValue = OperDeleteAccountInfo(request.getParameterMap());
        }

        renderData(response, JSONUtil.toJson(returnValue));
    }


    private Map OperAdd(Map<String, String[]> params)
    {
        AccountInfo accountInfo = new AccountInfo();
        accountInfo.setName(params.get("name")[0]);
        accountInfo.setAccountName(params.get("accountname")[0]);
        accountInfo.setPassword(params.get("password")[0]);
        accountMapper.addAccountInfo(accountInfo);

        return new HashMap<>();
    }

    private Map OperQueryNames(Map<String, String[]> params)
    {
        List<String> accountNames = accountMapper.queryAccountName();
        Map<String, List<String>> response = new HashMap<>();
        response.put("names", accountNames);
        return response;
    }

    private Map OperQueryPassword(Map<String, String[]> params)
    {
        List<AccountInfo> password = accountMapper.queryAccountInfo(params.get("name")[0]);
        Map<String, List<AccountInfo>> response = new HashMap<>();
        response.put("names", password);
        return response;
    }

    private Map OperUpdateAccountInfo(Map<String, String[]> params)
    {
        AccountInfo accountInfo = new AccountInfo();
        accountInfo.setId(Integer.parseInt(params.get("id")[0]));
        accountInfo.setName(params.get("name")[0]);
        accountInfo.setAccountName(params.get("accountName")[0]);
        accountInfo.setPassword(params.get("password")[0]);
        accountMapper.updateAccountInfo(accountInfo);
        Map<String, Integer> response = new HashMap<>();
        response.put("result", 0);
        return response;
    }

    private Map OperDeleteAccountInfo(Map<String, String[]> params)
    {
        accountMapper.deleteAccountInfo(Integer.parseInt(params.get("id")[0]));
        Map<String, Integer> response = new HashMap<>();
        response.put("result", 0);
        return response;
    }

    /**
     * 通过PrintWriter将响应数据写入response，ajax可以接受到这个数据
     *
     * @param response
     * @param data
     */
    private void renderData(HttpServletResponse response, String data) {
        PrintWriter printWriter = null;
        try {
            printWriter = response.getWriter();
            printWriter.print(data);
        } catch (IOException ex) {
        } finally {
            if (null != printWriter) {
                printWriter.flush();
                printWriter.close();
            }
        }
    }
}
