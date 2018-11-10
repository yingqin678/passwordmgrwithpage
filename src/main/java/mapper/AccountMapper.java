package mapper;

import service.AccountInfo;

import java.util.List;

public interface AccountMapper {
    void addAccountInfo(AccountInfo accountInfo);

    List<String> queryAccountName();

    List<AccountInfo> queryAccountInfo(String name);

    void updateAccountInfo(AccountInfo accountInfo);

    void deleteAccountInfo(int id);
}
