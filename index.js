module.exports = function(ret, conf, settings, opt) {

    fis.util.map(ret.src, function(subpath, file) {
        if (file.ext !== '.vm') {
            // 添加同名依赖
            // if (file.isJsLike) {
            //   file.addSameNameRequire('.css');
            // }
            return;
        }
        var content = file.getContent();
        var reg = /(#\*[\s\S]*?(?:\*#|$)|##[^\n\r\f]*)|(?:#(html|require|extends|widget)\s*\(\s*('|")(.*?)\3)/ig;
        var callback = function(m, comment, directive, quote, url) {
            if (url) {
              //console.info('url',url  )
                var depid = url.trim();
                var pos = depid.indexOf(':');
                if (pos > -1) {
                    var ns = depid.substring(0, pos);
                    var thisNamespace = fis.config.get('namespace');
                    if (ns !== thisNamespace) {
                      return m;
                    }
                }
                //console.info('file.id',file.id)
                if (depid !== file.id) {
                    file.addRequire(depid);
                }
            }
            return m;
        };
        content.replace(reg, callback);
        
        // 添加vm文件同名依赖,把组件的css和js添加到依赖列表中
        // console.log('***%s',file.id)
        file.addSameNameRequire('.js');
        file.addSameNameRequire('.css');
      
        //update ret.map
        if (file.requires && file.requires.length) {
            ret.map.res[file.id].deps = file.requires;
        }
    });
};
