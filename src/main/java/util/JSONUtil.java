package util;

import com.alibaba.fastjson.JSONObject;

/**
 * Created by yingmeng on 2017/7/9 0009.
 */
public class JSONUtil {

    public static String toJson(Object object){
        return JSONObject.toJSONString(object);
    }


}
